import os
import json

def create_flare_job(job_dir):
    os.makedirs(os.path.join(job_dir, "app", "config"), exist_ok=True)
    os.makedirs(os.path.join(job_dir, "app", "custom"), exist_ok=True)

    # 1. meta.json
    meta = {
        "name": "fed_fraud_xgboost",
        "resource_spec": {},
        "deploy_map": {
            "app": ["@ALL"]
        }
    }
    with open(os.path.join(job_dir, "meta.json"), "w") as f:
        json.dump(meta, f, indent=4)

    # 2. config_fed_server.json
    server_config = {
        "format_version": 2,
        "server": {
            "heart_beat_timeout": 600
        },
        "task_data_filters": [],
        "task_result_filters": [],
        "components": [
            {
                "id": "persistor",
                "path": "nvflare.app_opt.xgboost.histogram_based_v2.model_persistor.XGBModelPersistor",
                "args": {
                    "save_name": "xgboost_model.json"
                }
            },
            {
                "id": "shareable_generator",
                "path": "nvflare.app_common.shareablegenerators.full_model_shareable_generator.FullModelShareableGenerator",
                "args": {}
            },
            {
                "id": "aggregator",
                "path": "nvflare.app_common.aggregators.intime_accumulate_model_aggregator.InTimeAccumulateModelAggregator",
                "args": {}
            }
        ],
        "workflows": [
            {
                "id": "scatter_gather",
                "path": "nvflare.app_common.workflows.scatter_and_gather.ScatterAndGather",
                "args": {
                    "min_clients": 3,
                    "num_rounds": 5,
                    "start_round": 0,
                    "wait_time_after_min_received": 10,
                    "aggregator_id": "aggregator",
                    "persistor_id": "persistor",
                    "shareable_generator_id": "shareable_generator",
                    "train_task_name": "train",
                    "train_timeout": 0
                }
            }
        ]
    }
    with open(os.path.join(job_dir, "app", "config", "config_fed_server.json"), "w") as f:
        json.dump(server_config, f, indent=4)

    # 3. config_fed_client.json
    client_config = {
        "format_version": 2,
        "executors": [
            {
                "tasks": ["train"],
                "executor": {
                    "path": "nvflare.app_opt.xgboost.histogram_based_v2.executor.XGBoostExecutor",
                    "args": {
                        "early_stopping_rounds": 10,
                        "xgb_params": {
                            "max_depth": 5,
                            "eta": 0.1,
                            "objective": "binary:logistic",
                            "eval_metric": "auc",
                            "tree_method": "hist",
                            "scale_pos_weight": 18.0
                        },
                        "data_loader_id": "dataloader"
                    }
                }
            }
        ],
        "task_result_filters": [],
        "task_data_filters": [],
        "components": [
            {
                "id": "dataloader",
                "path": "custom_data_loader.FraudDataLoader",
                "args": {}
            }
        ]
    }
    with open(os.path.join(job_dir, "app", "config", "config_fed_client.json"), "w") as f:
        json.dump(client_config, f, indent=4)

    print(f"Generated FLARE job configuration at: {job_dir}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    job_dir = os.path.join(base_dir, "flare_jobs", "fraud_xgboost_job")
    create_flare_job(job_dir)

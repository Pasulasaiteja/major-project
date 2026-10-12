import pandas as pd
import numpy as np
import os
import glob
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
import xgboost as xgb

def load_and_preprocess_single_bank(file_path):
    print(f"Loading data from {os.path.basename(file_path)}...")
    df = pd.read_csv(file_path)
    
    numeric_features = ['Age', 'Transaction_Amount', 'Account_Balance']
    categorical_features = ['Gender', 'Account_Type', 'Transaction_Type', 'Merchant_Category', 'Device_Type', 'State']
    target = 'Is_Fraud'
    
    X = df[numeric_features + categorical_features]
    y = df[target]
    
    print(f"Bank Dataset shape: {X.shape}")
    print(f"Bank Class distribution:\n{y.value_counts(normalize=True)}")
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])
    
    return X, y, preprocessor

def train_single_node(file_path):
    X, y, preprocessor = load_and_preprocess_single_bank(file_path)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Let's adjust scale_pos_weight to handle the severe imbalance seen in the baseline
    scale_weight = len(y_train[y_train==0]) / max(1, len(y_train[y_train==1]))
    print(f"Using scale_pos_weight: {scale_weight:.2f}")

    model = ImbPipeline([
        ('preprocessor', preprocessor),
        ('smote', SMOTE(random_state=42)),
        ('classifier', xgb.XGBClassifier(
            use_label_encoder=False, 
            eval_metric='logloss', 
            random_state=42,
            scale_pos_weight=scale_weight
        ))
    ])
    
    print(f"Training local node model for {os.path.basename(file_path)}...")
    model.fit(X_train, y_train)
    
    print("Evaluating local model...")
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    print("\n--- Single Node Model Evaluation ---")
    print(f"Accuracy:  {accuracy_score(y_test, y_pred):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred):.4f}")
    print(f"Recall:    {recall_score(y_test, y_pred):.4f}")
    print(f"F1 Score:  {f1_score(y_test, y_pred):.4f}")
    print(f"AUC-ROC:   {roc_auc_score(y_test, y_prob):.4f}")
    
    return model

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    partitioned_dir = os.path.join(base_dir, 'data', 'partitioned_banks')
    
    # Get the first bank file
    bank_files = glob.glob(os.path.join(partitioned_dir, 'bank_1_*.csv'))
    
    if bank_files:
        train_single_node(bank_files[0])
    else:
        print("No partitioned data found. Run split_data.py first.")

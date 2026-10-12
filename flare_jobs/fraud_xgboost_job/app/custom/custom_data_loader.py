import os
import glob
import pandas as pd
import xgboost as xgb
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from imblearn.over_sampling import SMOTE
from nvflare.apis.fl_context import FLContext
from nvflare.app_common.abstract.data_loader import DataLoader

class FraudDataLoader(DataLoader):
    def __init__(self):
        super().__init__()

    def load_data(self, fl_ctx: FLContext):
        # Determine which client this is based on the site_name (e.g. site-1)
        client_name = fl_ctx.get_identity_name()
        # client_name is typically "site-1", "site-2", etc. in simulator
        try:
            client_idx = client_name.split("-")[1]
        except:
            client_idx = "1"
        
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
        partitioned_dir = os.path.join(base_dir, 'data', 'partitioned_banks')
        
        # Load the CSV for this specific bank
        bank_files = glob.glob(os.path.join(partitioned_dir, f'bank_{client_idx}_*.csv'))
        if not bank_files:
            raise FileNotFoundError(f"No data found for client {client_name}")
            
        file_path = bank_files[0]
        self.log_info(fl_ctx, f"Client {client_name} loading data from {file_path}")
        
        df = pd.read_csv(file_path)
        
        numeric_features = ['Age', 'Transaction_Amount', 'Account_Balance']
        categorical_features = ['Gender', 'Account_Type', 'Transaction_Type', 'Merchant_Category', 'Device_Type', 'State']
        
        X = df[numeric_features + categorical_features]
        y = df['Is_Fraud']
        
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), numeric_features),
                ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
            ])
            
        X_encoded = preprocessor.fit_transform(X)
        
        # Apply SMOTE locally
        smote = SMOTE(random_state=42)
        X_resampled, y_resampled = smote.fit_resample(X_encoded, y)
        
        # XGBoost requires DMatrix for the histogram executor
        dmat = xgb.DMatrix(X_resampled, label=y_resampled)
        
        # We simulate both train and validation with the same data here for simplicity,
        # but in a real scenario you split it.
        return {"train": dmat, "valid": dmat}

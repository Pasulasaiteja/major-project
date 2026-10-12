import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, classification_report
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
import xgboost as xgb
import os

def load_and_preprocess_data(file_path):
    print("Loading data...")
    df = pd.read_csv(file_path)
    
    # Select features
    numeric_features = ['Age', 'Transaction_Amount', 'Account_Balance']
    categorical_features = ['Gender', 'Account_Type', 'Transaction_Type', 'Merchant_Category', 'Device_Type', 'State']
    
    # Target
    target = 'Is_Fraud'
    
    X = df[numeric_features + categorical_features]
    y = df[target]
    
    print(f"Dataset shape: {X.shape}")
    print(f"Class distribution:\n{y.value_counts(normalize=True)}")
    
    # Preprocessing steps
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])
    
    return X, y, preprocessor

def train_baseline_model(file_path):
    X, y, preprocessor = load_and_preprocess_data(file_path)
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Create the modeling pipeline
    # We use ImbPipeline because standard sklearn Pipeline doesn't support SMOTE
    print("Setting up the pipeline with SMOTE and XGBoost...")
    model = ImbPipeline([
        ('preprocessor', preprocessor),
        ('smote', SMOTE(random_state=42)),
        ('classifier', xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42))
    ])
    
    print("Training the baseline model on the pooled dataset...")
    model.fit(X_train, y_train)
    
    print("Evaluating the model...")
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    print("\n--- Baseline Model Evaluation ---")
    print(f"Accuracy:  {accuracy_score(y_test, y_pred):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred):.4f}")
    print(f"Recall:    {recall_score(y_test, y_pred):.4f}")
    print(f"F1 Score:  {f1_score(y_test, y_pred):.4f}")
    print(f"AUC-ROC:   {roc_auc_score(y_test, y_prob):.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

if __name__ == "__main__":
    data_path = os.path.join(os.path.dirname(__file__), '..', '..', 'Bank_Transaction_Fraud_Detection.csv')
    train_baseline_model(data_path)

import pandas as pd
import os

def split_dataset_by_state(input_file, output_dir, num_banks=3):
    print(f"Loading {input_file}...")
    df = pd.read_csv(input_file)
    
    # We agreed to partition by 'State' to simulate different banks
    # Find the top states by transaction volume
    top_states = df['State'].value_counts().nlargest(num_banks).index.tolist()
    print(f"Selecting top {num_banks} states to simulate bank nodes: {top_states}")
    
    os.makedirs(output_dir, exist_ok=True)
    
    for i, state in enumerate(top_states, start=1):
        bank_df = df[df['State'] == state]
        output_path = os.path.join(output_dir, f'bank_{i}_{state}.csv')
        bank_df.to_csv(output_path, index=False)
        print(f"Saved Bank {i} (State: {state}) with {len(bank_df)} transactions to {output_path}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    input_csv = os.path.join(base_dir, 'Bank_Transaction_Fraud_Detection.csv')
    output_dir = os.path.join(base_dir, 'data', 'partitioned_banks')
    
    split_dataset_by_state(input_csv, output_dir, num_banks=3)

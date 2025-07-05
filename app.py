from flask import Flask, request, jsonify, render_template
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

app = Flask(__name__)

print("⏳ Loading model... (takes a few seconds)")
tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")
chat_history_ids = None
print("✅ Model loaded successfully")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    try:
        global chat_history_ids
        user_input = request.json["message"]
        print(f">>> User: {user_input}")

        new_input_ids = tokenizer.encode(user_input + tokenizer.eos_token, return_tensors='pt')

        if chat_history_ids is not None:
            bot_input_ids = torch.cat([chat_history_ids, new_input_ids], dim=-1)
        else:
            bot_input_ids = new_input_ids

        chat_history_ids = model.generate(
            bot_input_ids,
            max_length=1000,
            pad_token_id=tokenizer.eos_token_id
        )

        response = tokenizer.decode(
            chat_history_ids[:, bot_input_ids.shape[-1]:][0],
            skip_special_tokens=True
        )

        print(f"<<< Bot: {response}")
        return jsonify({"reply": response})
    except Exception as e:
        print("❌ Error in /chat:", e)
        return jsonify({"reply": "⚠️ Error processing your message."})


if __name__ == "__main__":
    app.run(debug=True)

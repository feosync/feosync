

from dotenv import load_dotenv
from qstash import QStash
import os

load_dotenv()
qstash_token = os.getenv("QSTASH_TOKEN")


client = QStash(qstash_token)

res = client.message.publish_json(
    url="https://example.com",
    body={"hello": "world"},
    headers={
        "test-header": "test-value",
    },
)

print(res.message_id)
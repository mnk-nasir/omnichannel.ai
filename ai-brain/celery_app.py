import os
from celery import Celery
import sentry_sdk
from sentry_sdk.integrations.celery import CeleryIntegration
from dotenv import load_dotenv

load_dotenv()

# Initialize Sentry for the Worker
sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN", ""),
    integrations=[CeleryIntegration()],
    traces_sample_rate=1.0,
    profiles_sample_rate=1.0,
)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Initialize Celery app
celery_app = Celery(
    "omnichannel_worker",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=['worker.tasks']
)

# Optional config
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

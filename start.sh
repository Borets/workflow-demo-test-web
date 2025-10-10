#!/bin/bash
set -e

# Export Python path to include parent directory
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Run poetry from workflows directory but with correct Python path
cd workflows
exec poetry run python -m workflows.main


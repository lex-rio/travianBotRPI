#!/bin/bash

. ./settings.txt

PROJECT_DIRECTORY="travianBotRPI"

echo ${WORK_PATH}

rsync -avrc -e "ssh " \
        --delete \
        --exclude="node_modules"  \
        --exclude=".env"  \
        --exclude=".git"  \
        --exclude=".vscode" \
        ${WORK_PATH}/${PROJECT_DIRECTORY}/ ${USER}@${HOST}:${REMOTE_PATH}/${PROJECT_DIRECTORY}/

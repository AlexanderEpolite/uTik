#!/usr/bin/env bash

ffmpeg -i /tmp/${1}.mp4 -t 1 -vf cropdetect -f null - 2>&1 | awk '/crop/ { print $NF }' | tail -1

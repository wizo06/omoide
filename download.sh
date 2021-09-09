#!/bin/bash

mkdir temp_218noma
youtube-dl -f best -o 'temp_218noma/%(upload_date)s_%(id)s_%(title)s.%(ext)s' "$1"
rclone copy temp_218noma/* 218noma: --progress
rm -rf temp_218noma
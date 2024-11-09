#!/bin/bash

## AMD profiler for linux used to measure gpu usage
total_gpu_usage=0
total_vram_usage=0
count=0

duration=10

start_time=$(date +%s)

while true; do
    current_time=$(date +%s)

    elapsed_time=$((current_time - start_time))
    if [ "$elapsed_time" -ge "$duration" ]; then
        break
    fi

    gpu_info=$(radeontop -d - -l 1 | grep -oP 'gpu \K[\d.]+%|vram \K[\d.]+%')
    gpu_usage=$(echo "$gpu_info" | sed -n '1p' | tr -d '%')


    total_gpu_usage=$(echo "$total_gpu_usage + $gpu_usage" | bc)
    count=$((count + 1))

    sleep 1
done

average_gpu_usage=$(echo "scale=2; $total_gpu_usage / $count" | bc)

echo $average_gpu_usage

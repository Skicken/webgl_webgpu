#!/bin/bash
get_cpu_usage() {
    local cpu_a=($(sed -n '1p' /proc/stat))
    local idle_a=${cpu_a[4]}
    local total_a=$(( ${cpu_a[1]} + ${cpu_a[2]} + ${cpu_a[3]} + ${cpu_a[4]} + ${cpu_a[5]} + ${cpu_a[6]} + ${cpu_a[7]} ))
    sleep 0.5
    local cpu_b=($(sed -n '1p' /proc/stat))
    local idle_b=${cpu_b[4]}
    local total_b=$(( ${cpu_b[1]} + ${cpu_b[2]} + ${cpu_b[3]} + ${cpu_b[4]} + ${cpu_b[5]} + ${cpu_b[6]} + ${cpu_b[7]} ))
    local cpu_diff=$(( $total_b - $total_a ))
    local idle_diff=$(( $idle_b - $idle_a ))
    local cpu_usage=$(( 100 * ($cpu_diff - $idle_diff) / $cpu_diff ))
    echo "$cpu_usage%"
}
while true; do

    cpu_usage=$(get_cpu_usage)
    ram_usage=$(free -m | awk '/Mem:/ { printf("%.2f%%", $3/$2 * 100.0) }')

    gpu_info=$(radeontop -d - -l 1 | grep -oP 'gpu \K[\d.]+%|vram \K[\d.]+%( \d+\.\d+mb)?')
    
    gpu_usage=$(echo "$gpu_info" | sed -n '1p')
    vram_usage=$(echo "$gpu_info" | sed -n '2p')

    echo "CPU: $cpu_usage, RAM: $ram_usage, GPU: $gpu_usage, VRAM: $vram_usage"

    sleep 1
done

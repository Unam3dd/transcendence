#!/bin/sh
echo -e "\033[32mSNYK Analyze backend files\033[00m"
snyk code test backend
echo -e "\033[32mSNYK Analyze frontend files\033[00m"
snyk code test frontend
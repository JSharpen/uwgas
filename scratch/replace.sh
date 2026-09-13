#!/bin/bash
# A script to refactor GlobalSetupCard.tsx safely

# Create a backup
cp src/components/calculator/GlobalSetupCard.tsx scratch/GlobalSetupCard.tsx.bak

# Split the return statement
# We will use awk to find the `return (` block and wrap it

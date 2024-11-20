INPUT_FILE=".data/assignment_prod.log"
DECODED_FILE="./decoded_output.txt"

# Create output file if not existing
touch $DECODED_FILE
# Ensure output file is empty before starting
>$DECODED_FILE

# Read input file line by line
while IFS= read -r line; do
    # Check if the line starts with "BASE64:"
    if [[ "$line" == BASE64:* ]]; then
        # Extract the base64-encoded part (everything after "BASE64:")
        encoded_part="${line#BASE64:}"
        encoded_part=$(echo "$encoded_part" | tr -d '[:space:]')

        # Add padding if necessary
        padding=$((4 - (${#encoded_part} % 4)))
        if ((padding < 4)); then
            encoded_part+=$(printf '=%.0s' $(seq 1 $padding))
        fi

        # Decode and handle errors
        if echo "$encoded_part" | base64 --decode >/dev/null 2>&1; then
            # Base64 decode the string and append to  output file
            echo "$encoded_part" | base64 --decode >>"$DECODED_FILE"
            # Append a newline
            echo >>"$DECODED_FILE"
        else
            echo "Invalid Base64 data: $encoded_part" >>"$DECODED_FILE"
        fi

    fi
done <"$INPUT_FILE"

echo "Decoding complete. Decoded strings are saved in $DECODED_FILE"

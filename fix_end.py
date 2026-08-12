with open('src/components/ScoringForm.tsx', 'r') as f:
    content = f.read()

# Let's find the LAST occurrence of `</form>`
idx = content.rfind('</form>')
if idx != -1:
    # Get everything up to the last </form>
    content = content[:idx + 7]
    # And then we need to close the conditional from the beginning of the form and close the div
    content += "\n      )}\n    </div>\n  );\n};\n"
    
    with open('src/components/ScoringForm.tsx', 'w') as f:
        f.write(content)

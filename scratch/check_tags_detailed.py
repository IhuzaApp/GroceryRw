import re

def find_unclosed_tags(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    # Regex to find tags, ignoring self-closing ones if any (rare for div)
    tags = re.finditer(r'<(div|/div)', content)
    
    stack = []
    lines = content.split('\n')
    
    def get_line_no(pos):
        return content.count('\n', 0, pos) + 1

    for match in tags:
        tag = match.group(1)
        line_no = get_line_no(match.start())
        if tag == 'div':
            stack.append(('div', line_no))
        else:
            if not stack:
                print(f"Extra </div> found at line {line_no}")
            else:
                stack.pop()
    
    if stack:
        print("Unclosed tags:")
        for tag, line in stack:
            print(f"  <{tag}> opened at line {line}")
    else:
        print("Tags are balanced!")

find_unclosed_tags('/Users/apple/Documents/Projects/grocery/src/components/shopper/DeliveryConfirmationModal.tsx')

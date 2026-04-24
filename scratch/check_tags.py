import re

def find_unclosed_tags(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    # Simple regex to find tags, ignoring those in strings or comments is hard
    # but let's try a basic one.
    tags = re.findall(r'<(div|/div)', content)
    
    stack = []
    for tag in tags:
        if tag == 'div':
            stack.append('div')
        else:
            if not stack:
                print("Extra </div> found!")
            else:
                stack.pop()
    
    if stack:
        print(f"Unclosed tags: {stack}")
    else:
        print("Tags are balanced!")

find_unclosed_tags('/Users/apple/Documents/Projects/grocery/src/components/shopper/DeliveryConfirmationModal.tsx')

def check_braces(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    stack = []
    lines = content.split('\n')
    for i, line in enumerate(lines):
        for char in line:
            if char == '{':
                stack.append(('{', i + 1))
            elif char == '}':
                if not stack:
                    print(f"Extra '}}' at line {i + 1}")
                    return
                stack.pop()
            elif char == '(':
                stack.append(('(', i + 1))
            elif char == ')':
                if not stack:
                    print(f"Extra ')' at line {i + 1}")
                    return
                stack.pop()
            elif char == '[':
                stack.append(('[', i + 1))
            elif char == ']':
                if not stack:
                    print(f"Extra ']' at line {i + 1}")
                    return
                stack.pop()
    
    if stack:
        for char, line in stack:
            print(f"Unclosed '{char}' from line {line}")
    else:
        print("Braces are balanced!")

check_braces('/Users/apple/Documents/Projects/grocery/src/components/shopper/DeliveryConfirmationModal.tsx')

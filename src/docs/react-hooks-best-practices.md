# React Hooks Best Practices Guide

## Common Hook Ordering Issues

One of the most common issues with React Hooks is violating the "Rules of Hooks" by conditionally calling hooks or changing their order between renders. This document outlines best practices to prevent these issues.

## The Rules of Hooks

1. **Only call hooks at the top level** - Don't call hooks inside loops, conditions, or nested functions.
2. **Only call hooks from React function components** - Don't call hooks from regular JavaScript functions.

## Component Structure Best Practices

Follow this structure for all React components:

```tsx
function MyComponent(props) {
  // 1. Define all hooks first
  const [state, setState] = useState(initialState);
  const context = useContext(MyContext);
  const ref = useRef(null);

  // 2. Define memoized values and callbacks
  const memoizedValue = useMemo(() => computeExpensiveValue(), [deps]);
  const memoizedCallback = useCallback(() => { doSomething() }, [deps]);

  // 3. Define effects
  useEffect(() => {
    // Side effects
    return () => { /* cleanup */ };
  }, [deps]);

  // 4. Define helper functions
  const handleClick = () => { /* event handler */ };

  // 5. Conditional returns (AFTER all hooks)
  if (condition) return null;

  // 6. Return JSX
  return <div>{/* JSX */}</div>;
}
```

## Early Returns

Be very careful with early returns in components:

```tsx
// ❌ BAD - returning before all hooks are called
function BadComponent({ isActive }) {
  if (!isActive) return null;

  // This hook won't be called when isActive is false
  const [state, setState] = useState(initial);

  return <div>{state}</div>;
}

// ✅ GOOD - all hooks called unconditionally first
function GoodComponent({ isActive }) {
  const [state, setState] = useState(initial);

  // Only return after all hooks are called
  if (!isActive) return null;

  return <div>{state}</div>;
}
```

## Use Custom Hooks for Complex Logic

Extract complex logic into custom hooks:

```tsx
// ✅ GOOD - Complex logic extracted to custom hook
function useComplexLogic(params) {
  const [state, setState] = useState(initial);
  // Other hooks and logic...

  return { data, actions };
}

// Component becomes simpler and easier to reason about
function MyComponent(props) {
  const { data, actions } = useComplexLogic(props);

  // Component logic with returned values
  return <div>{/* JSX */}</div>;
}
```

## Handling Conditional Logic

Move conditions inside hooks rather than conditionally calling hooks:

```tsx
// ❌ BAD - Conditional hook call
function BadComponent({ showCounter }) {
  if (showCounter) {
    useEffect(() => {
      // Counter logic
    }, []);
  }
}

// ✅ GOOD - Condition inside the hook
function GoodComponent({ showCounter }) {
  useEffect(() => {
    if (!showCounter) return;

    // Counter logic
  }, [showCounter]);
}
```

## ESLint Plugin for React Hooks

We use the ESLint plugin for React Hooks to catch these issues:

```json
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## Additional Resources

- [React Hooks Documentation](https://reactjs.org/docs/hooks-intro.html)
- [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html)
- [ESLint Plugin for React Hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)

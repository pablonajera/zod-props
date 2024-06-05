## zod-props

A powerful and easy-to-use higher-order component (HOC) for runtime prop validation in React powered by [Zod](https://zod.dev). It ensures your components receive the correct props, enhancing robustness and reducing runtime errors. No TypeScript required for the consumer!

### Key Features

- **Schema-Based Validation** - Uses Zod for defining and validating prop schemas
- **Easy Integration** - Simple HOC pattern for wrapping your components
- **Error Reporting** - Provides clear error messages when prop validation fails
- **TypeScript Support** - Works seamlessly with TypeScript
- **JavaScript Support** - Works with plain JavaScript too! You don't need to use TypeScript.


### Installation

```bash
npm install zod-props

# or

yarn add zod-props
```

### Usage

Just `zop` your component with a Zod schema to enable prop validation. If the props don't match the schema, an error will be thrown.

```jsx
import zop from 'zod-props';
import { z } from 'zod';

// Define the schema
const Props = z.object({
  name: z.string(),
  age: z.number().optional(),
});

// Original component
const MyComponent = ({ name, age }) => (
  <div>
    <h1>Hello, {name}!</h1>
    {age && <p>Age: {age}</p>}
  </div>
);

// Simply export the component wrapped with zop
export default zop(MyComponent, Props);
```
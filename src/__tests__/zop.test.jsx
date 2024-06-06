/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { z } from 'zod'
import { zop } from '../zop'

describe('zop', () => {
  let propsSchema,
    TestComponent,
    ValidatedComponent,
    consoleErrorFn

  beforeEach(() => {
    consoleErrorFn = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorFn.mockRestore()
  })

  describe('for Component', () => {
    beforeEach(() => {
      propsSchema = z.object({
        name: z.string().min(1),
        age: z.number().optional()
      })

      TestComponent = ({ name, age, children }) => (
        <div>
          <h1>Hello, {name}!</h1>
          {age && <p>Age: {age}</p>}
          {children}
        </div>
      )

      ValidatedComponent = zop(TestComponent, propsSchema)
    })

    describe('without props', () => {
      test('throws error without any props', () => {
        expect(() => render(<ValidatedComponent />)).toThrow()
      })
    })

    describe('with valid props', () => {
      test('renders correctly with valid props', () => {
        const { getByText } = render(<ValidatedComponent name="John" age={30}><p>Child</p></ValidatedComponent>)
        expect(getByText('Hello, John!')).toBeInTheDocument()
        expect(getByText('Age: 30')).toBeInTheDocument()
        expect(getByText('Child')).toBeInTheDocument()
      })

      test('renders correctly without optional age prop', () => {
        const { getByText } = render(<ValidatedComponent name="John"><p>Child</p></ValidatedComponent>)
        expect(getByText('Hello, John!')).toBeInTheDocument()
        expect(getByText('Child')).toBeInTheDocument()
      })

      test('renders correctly without children', () => {
        const { getByText } = render(<ValidatedComponent name="John" age={30} />)
        expect(getByText('Hello, John!')).toBeInTheDocument()
        expect(getByText('Age: 30')).toBeInTheDocument()
      })

      test('renders correctly with multiple children', () => {
        const { getByText } = render(
        <ValidatedComponent name="John" age={30}>
          <p>Child 1</p>
          <p>Child 2</p>
        </ValidatedComponent>
        )
        expect(getByText('Hello, John!')).toBeInTheDocument()
        expect(getByText('Age: 30')).toBeInTheDocument()
        expect(getByText('Child 1')).toBeInTheDocument()
        expect(getByText('Child 2')).toBeInTheDocument()
      })
    })

    describe('with invalid props', () => {
      test('throws error with missing required name prop', () => {
        expect(() => render(<ValidatedComponent age={30} />)).toThrow()
      })

      test('throws error with invalid name prop type', () => {
        expect(() => render(<ValidatedComponent name={123} />)).toThrow()
      })

      test('throws error with invalid age prop type', () => {
        expect(() => render(<ValidatedComponent name="John" age={'thirty'} />)).toThrow()
      })

      test('throws error with invalid name prop value (empty string)', () => {
        expect(() => render(<ValidatedComponent name="" />)).toThrow()
      })

      test('throws error with multiple invalid props', () => {
        expect(() => render(<ValidatedComponent name={123} age="thirty" />)).toThrow()
      })
    })
  })

  describe('for class component', () => {
    beforeEach(() => {
      propsSchema = z.object({
        name: z.string().min(1),
        age: z.number().optional()
      })
      class ClassComponent extends React.Component {
        render () {
          const { name, age, children } = this.props
          return (
          <div>
            <h1>Hello, {name}!</h1>
            {age !== null && age !== undefined && <p>Age: {age}</p>}
            {children}
          </div>
          )
        }
      }

      ValidatedComponent = zop(ClassComponent, propsSchema)
    })

    describe('without props', () => {
      test('throws error without any props', () => {
        expect(() => render(<ValidatedComponent />)).toThrow()
      })
    })

    describe('with valid props', () => {
      test('renders correctly with valid props', () => {
        const { getByText } = render(<ValidatedComponent name="John" age={30}><p>Child</p></ValidatedComponent>)
        expect(getByText('Hello, John!')).toBeInTheDocument()
        expect(getByText('Age: 30')).toBeInTheDocument()
        expect(getByText('Child')).toBeInTheDocument()
      })

      test('renders correctly without optional age prop', () => {
        const { getByText } = render(<ValidatedComponent name="John"><p>Child</p></ValidatedComponent>)
        expect(getByText('Hello, John!')).toBeInTheDocument()
        expect(getByText('Child')).toBeInTheDocument()
      })

      test('renders correctly without children', () => {
        const { getByText } = render(<ValidatedComponent name="John" age={30} />)
        expect(getByText('Hello, John!')).toBeInTheDocument()
        expect(getByText('Age: 30')).toBeInTheDocument()
      })

      test('renders correctly with multiple children', () => {
        const { getByText } = render(
          <ValidatedComponent name="John" age={30}>
            <p>Child 1</p>
            <p>Child 2</p>
          </ValidatedComponent>
        )
        expect(getByText('Hello, John!')).toBeInTheDocument()
        expect(getByText('Age: 30')).toBeInTheDocument()
        expect(getByText('Child 1')).toBeInTheDocument()
        expect(getByText('Child 2')).toBeInTheDocument()
      })
    })

    describe('with invalid props', () => {
      test('throws error with missing required name prop', () => {
        expect(() => render(<ValidatedComponent age={30} />)).toThrow()
      })

      test('throws error with invalid name prop type', () => {
        expect(() => render(<ValidatedComponent name={123} />)).toThrow()
      })

      test('throws error with invalid age prop type', () => {
        expect(() => render(<ValidatedComponent name="John" age={'thirty'} />)).toThrow()
      })

      test('throws error with invalid name prop value (empty string)', () => {
        expect(() => render(<ValidatedComponent name="" />)).toThrow()
      })

      test('throws error with multiple invalid props', () => {
        expect(() => render(<ValidatedComponent name={123} age="thirty" />)).toThrow()
      })
    })
  })

  describe('with conditional props', () => {
    beforeEach(() => {
      propsSchema = z.object({
        type: z.enum(['admin', 'user']),
        adminCode: z.string().optional()
      }).refine((data) => {
        if (data.type === 'admin' && !data.adminCode) {
          return false
        }
        return true
      }, { message: 'adminCode is required for admins' })

      TestComponent = ({ type, adminCode }) => (
        <div>
          <h1>Type: {type}</h1>
          {adminCode && <p>Admin Code: {adminCode}</p>}
        </div>
      )

      ValidatedComponent = zop(TestComponent, propsSchema)
    })

    test('renders correctly with conditional required prop', () => {
      const { getByText } = render(<ValidatedComponent type="admin" adminCode="1234" />)
      expect(getByText('Type: admin')).toBeInTheDocument()
      expect(getByText('Admin Code: 1234')).toBeInTheDocument()
    })

    test('throws error without required conditional prop', () => {
      expect(() => render(<ValidatedComponent type="admin" />)).toThrow()
    })
  })

  describe('with default props', () => {
    beforeEach(() => {
      propsSchema = z.object({
        name: z.string(),
        age: z.number().default(25)
      })

      TestComponent = ({ name, age }) => (
        <div>
          <h1>Hello, {name}!</h1>
          {age !== null && age !== undefined && <p>Age: {age}</p>}
        </div>
      )

      ValidatedComponent = zop(TestComponent, propsSchema)
    })
    test('renders correctly with default prop values', () => {
      const { getByText } = render(<ValidatedComponent name="John" />)
      expect(getByText('Hello, John!')).toBeInTheDocument()
      expect(getByText('Age: 25')).toBeInTheDocument()
    })

    test('renders correctly with default prop values and valid prop values', () => {
      const { getByText } = render(<ValidatedComponent name="John" age={30} />)
      expect(getByText('Hello, John!')).toBeInTheDocument()
      expect(getByText('Age: 30')).toBeInTheDocument()
    })
  })

  describe('with array props', () => {
    beforeEach(() => {
      propsSchema = z.object({
        items: z.array(z.string())
      })

      TestComponent = ({ items }) => (
        <div>
          {items.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
      )

      ValidatedComponent = zop(TestComponent, propsSchema)
    })

    test('renders correctly', () => {
      const { getByText } = render(<ValidatedComponent items={['Item 1', 'Item 2', 'Item 3']} />)
      expect(getByText('Item 1')).toBeInTheDocument()
      expect(getByText('Item 2')).toBeInTheDocument()
      expect(getByText('Item 3')).toBeInTheDocument()
    })

    test('throws error with invalid array items', () => {
      expect(() => render(<ValidatedComponent items={['Item 1', 2, 'Item 3']} />)).toThrow()
    })
  })

  describe('with dynamic props', () => {
    beforeEach(() => {
      propsSchema = z.object({
        type: z.enum(['simple', 'complex']),
        data: z.union([
          z.string().refine((val) => val === 'simpleData', 'Invalid simple data'),
          z.object({ nested: z.string() }).refine((val) => val.nested === 'complexData', 'Invalid complex data')
        ])
      })

      TestComponent = ({ type, data }) => (
        <div>
          <h1>Type: {type}</h1>
          {typeof data === 'string' ? <p>Data: {data}</p> : <p>Nested Data: {data.nested}</p>}
        </div>
      )

      ValidatedComponent = zop(TestComponent, propsSchema)
    })

    test('validates dynamic props correctly', () => {
      const { getByText } = render(<ValidatedComponent type="simple" data="simpleData" />)
      expect(getByText('Type: simple')).toBeInTheDocument()
      expect(getByText('Data: simpleData')).toBeInTheDocument()

      const { getByText: getByText2 } = render(<ValidatedComponent type="complex" data={{ nested: 'complexData' }} />)
      expect(getByText2('Type: complex')).toBeInTheDocument()
      expect(getByText2('Nested Data: complexData')).toBeInTheDocument()
    })

    test('throws error with invalid dynamic props', () => {
      expect(() => render(<ValidatedComponent type="simple" data="invalidSimpleData" />)).toThrow()
      expect(() => render(<ValidatedComponent type="complex" data={{ nested: 'invalidComplexData' }} />)).toThrow()
    })
  })
})

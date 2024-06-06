import React from 'react'
import { render, type RenderResult } from '@testing-library/react'
import '@testing-library/jest-dom'
import { z } from 'zod'
import { zop } from '../zop'

describe('zop', () => {
  let consoleErrorFn: jest.SpyInstance<void, any>
  let propsSchema

  beforeEach(() => {
    consoleErrorFn = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorFn.mockRestore()
  })

  describe('for Component', () => {
    let TestComponent: React.FC<{ name: string, age?: number, children?: React.ReactNode }>
    let ValidatedComponent: React.ComponentType<{
      name: string
      age?: number
      children?: React.ReactNode
    }>

    beforeEach(() => {
      propsSchema = z.object({
        name: z.string().min(1),
        age: z.number().optional()
      })

      TestComponent = ({ name, age, children }) => (
        <div>
          <h1>Hello, {name}!</h1>
          {age !== null && age !== undefined && <p>Age: {age}</p>}
          {children}
        </div>
      )

      ValidatedComponent = zop(TestComponent, propsSchema)
    })

    describe('with valid props', () => {
      test('renders correctly with valid props', () => {
        const { getByText }: RenderResult = render(<ValidatedComponent name="John" age={30}><p>Child</p></ValidatedComponent>)
        expect(getByText('Hello, John!')).toBeInTheDocument()
        expect(getByText('Age: 30')).toBeInTheDocument()
        expect(getByText('Child')).toBeInTheDocument()
      })

      test('renders correctly without optional age prop', () => {
        const { getByText }: RenderResult = render(<ValidatedComponent name="John"><p>Child</p></ValidatedComponent>)
        expect(getByText('Hello, John!')).toBeInTheDocument()
        expect(getByText('Child')).toBeInTheDocument()
      })

      test('renders correctly without children', () => {
        const { getByText }: RenderResult = render(<ValidatedComponent name="John" age={30} />)
        expect(getByText('Hello, John!')).toBeInTheDocument()
        expect(getByText('Age: 30')).toBeInTheDocument()
      })

      test('renders correctly with multiple children', () => {
        const { getByText }: RenderResult = render(
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
      test('throws error with invalid name prop type', () => {
        expect(() => render(<ValidatedComponent name={123 as any} />)).toThrow()
      })

      test('throws error with invalid age prop type', () => {
        expect(() => render(<ValidatedComponent name="John" age={'thirty' as any} />)).toThrow()
      })

      test('throws error with invalid age prop value (null)', () => {
        expect(() => render(<ValidatedComponent name="John" age={null as any} />)).toThrow()
      })

      test('throws error with invalid name prop value (empty string)', () => {
        expect(() => render(<ValidatedComponent name="" />)).toThrow()
      })
    })
  })

  describe('for class component', () => {
    let ValidatedComponent: React.ComponentType<{
      name: string
      age?: number
      children?: React.ReactNode
    }>

    beforeEach(() => {
      propsSchema = z.object({
        name: z.string().min(1),
        age: z.number().optional()
      })
      class TestClassComponent extends React.Component<{ name: string, age?: number }> {
        render (): JSX.Element {
          const { name, age } = this.props
          return (
          <div>
            <h1>Hello, {name}!</h1>
            {age !== null && age !== undefined && <p>Age: {age}</p>}
          </div>
          )
        }
      }

      ValidatedComponent = zop(TestClassComponent, propsSchema)
    })

    describe('with valid props', () => {
      test('renders correctly with valid props', () => {
        const { getByText }: RenderResult = render(<ValidatedComponent name="John" age={30} />)
        expect(getByText('Hello, John!')).toBeInTheDocument()
        expect(getByText('Age: 30')).toBeInTheDocument()
      })

      test('renders correctly without optional age prop', () => {
        const { getByText }: RenderResult = render(<ValidatedComponent name="John" />)
        expect(getByText('Hello, John!')).toBeInTheDocument()
      })
    })

    describe('with invalid props', () => {
      test('throws error with invalid name prop type', () => {
        expect(() => render(<ValidatedComponent name={123 as any} />)).toThrow()
      })

      test('throws error with invalid age prop type', () => {
        expect(() => render(<ValidatedComponent name="John" age={'thirty' as any} />)).toThrow()
      })

      test('throws error with invalid age prop value (null)', () => {
        expect(() => render(<ValidatedComponent name="John" age={null as any} />)).toThrow()
      })

      test('throws error with invalid name prop value (empty string)', () => {
        expect(() => render(<ValidatedComponent name="" />)).toThrow()
      })
    })
  })

  describe('with conditional props', () => {
    let TestComponent: React.FC<{ type: 'admin' | 'user', adminCode?: string }>
    let ValidatedComponent: React.ComponentType<{ type: 'admin' | 'user', adminCode?: string }>

    beforeEach(() => {
      propsSchema = z.object({
        type: z.enum(['admin', 'user']),
        adminCode: z.string().optional()
      }).refine((data) => {
        if (data.type === 'admin' && (data.adminCode === undefined || data.adminCode === null || data.adminCode === '')) {
          return false
        }
        return true
      }, { message: 'adminCode is required for admins' })

      TestComponent = ({ type, adminCode }) => (
        <div>
          <h1>Type: {type}</h1>
          {adminCode !== null && adminCode !== undefined && <p>Admin Code: {adminCode}</p>}
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
    let TestComponent: React.FC<{ name: string, age?: number }>
    let ValidatedComponent: React.ComponentType<{ name: string, age?: number }>

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
    let TestComponent: React.FC<{ items: string[] }>
    let ValidatedComponent: React.ComponentType<{ items: string[] }>

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
  })

  describe('with dynamic props', () => {
    let TestComponent: React.FC<{ type: 'simple' | 'complex', data: string | { nested: string } }>
    let ValidatedComponent: React.ComponentType<{ type: 'simple' | 'complex', data: string | { nested: string } }>

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

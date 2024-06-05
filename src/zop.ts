import React from 'react'
import { ZodType } from 'zod'
import { fromError } from 'zod-validation-error'
import { ZopError } from './errors/ZopValidation'

interface Props {
  children?: React.ReactNode
  [key: string]: any
}

function validatePropsUsingSchema<T extends object> (
  schema: ZodType<T>,
  props: any,
  componentName: string
): T {
  const result = schema.safeParse(props)
  if (!result.success) {
    const validationError = fromError(result.error)
    throw new ZopError(componentName, validationError.toString())
  }
  return result.data
}

// This is a runtime check that is used to ensure that the schema is a valid Zod schema.
// This is necessary because TypeScript types are erased at runtime and we can't rely on them
// to check the type of the schema.
function validateSchema (schema: any): asserts schema is ZodType {
  if (!(schema instanceof ZodType)) {
    throw new TypeError('schema must be an instance of ZodType')
  }
}

// This is a runtime check that is used to ensure that the props object is a valid object.
// This is necessary because TypeScript types are erased at runtime and we can't rely on them
// to check the type of the props object.
function validatePropsObject (props: Props): asserts props is Props {
  if (typeof props !== 'object' || props === null) {
    throw new TypeError('props must be an object')
  }
  if (props.children !== undefined && typeof props.children !== 'object') {
    throw new TypeError('children must be an object')
  }
}

// Validate the props using the Zod schema and returns a new component
// that wraps the original component
export function zop<P extends object> (
  Component: React.ComponentType<P>,
  schema: ZodType<P>
): React.ComponentType<P> {
  validateSchema(schema)
  return (props: Props) => {
    validatePropsObject(props)
    const validProps = validatePropsUsingSchema(
      schema,
      props,
      Component.displayName ?? Component.name
    )
    return React.createElement(Component, {
      ...validProps,
      children: props.children
    })
  }
}

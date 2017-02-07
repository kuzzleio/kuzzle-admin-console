export const elements = {
  'input:text': {
    id: 'input:text',
    name: 'input text',
    tag: 'input',
    type: 'text'
  },
  'textarea': {
    id: 'textarea',
    name: 'textarea',
    tag: 'textarea'
  },
  'select': {
    id: 'select',
    name: 'select',
    tag: 'select'
  },
  'mselect': {
    id: 'mselect',
    name: 'multi select',
    tag: 'mselect'
  },
  'checkbox': {
    id: 'checkbox',
    name: 'checkbox',
    tag: 'checkbox'
  },
  'input:number:integer': {
    id: 'input:number:integer',
    name: 'input number',
    tag: 'input',
    type: 'number',
    step: 1
  },
  'input:number:short': {
    id: 'input:number:short',
    name: 'input number',
    tag: 'input',
    type: 'number',
    step: 0.001
  },
  'input:number:float': {
    id: 'input:number:float',
    name: 'input number',
    tag: 'input',
    type: 'number',
    step: 1e-9
  },
  'input:number:double': {
    id: 'input:number:double',
    name: 'input number',
    tag: 'input',
    type: 'number',
    step: 1e-17
  },
  'input:number:halfFloat': {
    id: 'input:number:halfFloat',
    name: 'input number',
    tag: 'input',
    type: 'number',
    step: 1e-4
  },
  'input:fieldset': {
    id: 'input:fieldset',
    name: 'fieldset',
    tag: 'fieldset'
  },
  'geopoint': {
    id: 'geopoint',
    name: 'geo point',
    tag: 'geo-point'
  },
  'json': {
    id: 'json',
    name: 'json',
    tag: 'json'
  }
}

export const elementJson = elements['json']

export const config = {
  keyword: {
    elements: [
      elements['input:text'],
      elements['textarea'],
      elements['select'],
      elements['mselect']
    ],
    default: elements['input:text']
  },
  text: {
    elements: [
      elements['input:text'],
      elements['textarea'],
      elements['select'],
      elements['mselect']
    ],
    default: elements['input:text']
  },
  boolean: {
    elements: [
      elements['checkbox'],
      elements['input:text']
    ],
    default: elements['checkbox']
  },
  long: {
    elements: [
      elements['input:number:integer']
    ],
    default: elements['input:number:integer']
  },
  integer: {
    elements: [
      elements['input:number:integer']
    ],
    default: elements['input:number:integer']
  },
  short: {
    elements: [
      elements['input:number:short']
    ],
    default: elements['input:number:short']
  },
  byte: {
    elements: [
      elements['input:number:integer']
    ],
    default: elements['input:number:integer']
  },
  double: {
    elements: [
      elements['input:number:double']
    ],
    default: elements['input:number:double']
  },
  float: {
    elements: [
      elements['input:number:float']
    ],
    default: elements['input:number:float']
  },
  half_float: {
    elements: [
      elements['input:number:halfFloat']
    ],
    default: elements['input:number:halfFloat']
  },
  scaled_float: {
    elements: [
      elements['input:number:float']
    ],
    default: elements['input:number:float']
  },
  object: {
    elements: [
      elements['input:fieldset']
    ],
    default: elements['input:fieldset']
  },
  nested: {
    elements: [
      elements['input:fieldset']
    ],
    default: elements['input:fieldset']
  },
  ip: {
    elements: [
      elements['input:text']
    ],
    default: elements['input:text']
  },
  date: {
    elements: [
      elements['input:text']
    ],
    default: elements['input:text']
  },
  binary: {
    elements: [
      elements['input:text'],
      elements['input:textarea']
    ],
    default: elements['input:textarea']
  },
  geo_point: {
    elements: [
      elements['geopoint'],
      elements['input:text']
    ],
    default: elements['geopoint']
  }
}

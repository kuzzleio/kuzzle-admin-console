export const elements = {
  'input:text': {
    id: 'input:text',
    name: 'Input text',
    tag: 'input',
    type: 'text'
  },
  textarea: {
    id: 'textarea',
    name: 'Textarea',
    tag: 'textarea'
  },
  'rich-text': {
    id: 'rich-text',
    name: 'Rich text',
    tag: 'rich-text'
  },
  'select:text': {
    id: 'select:text',
    name: 'Select box with text',
    tag: 'select',
    type: 'text',
    chooseValues: true
  },
  'select:integer': {
    id: 'select:integer',
    name: 'Select box with integer',
    tag: 'select',
    cast: 'integer',
    chooseValues: true
  },
  'select:float': {
    id: 'select:float',
    name: 'Select box with float',
    tag: 'select',
    cast: 'float',
    chooseValues: true
  },
  'mselect:text': {
    id: 'mselect:text',
    name: 'Multi select',
    tag: 'mselect',
    chooseValues: true,
    type: 'text'
  },
  'mselect:integer': {
    id: 'mselect:integer',
    name: 'Multi select',
    tag: 'mselect',
    chooseValues: true,
    cast: 'integer'
  },
  checkbox: {
    id: 'checkbox',
    name: 'Checkbox',
    tag: 'checkbox'
  },
  'input:number:integer': {
    id: 'input:number:integer',
    name: 'Input number',
    tag: 'input',
    type: 'number',
    cast: 'integer',
    step: 1
  },
  'input:number:short': {
    id: 'input:number:short',
    name: 'Input number',
    tag: 'input',
    type: 'number',
    cast: 'float',
    step: 0.001
  },
  'input:number:float': {
    id: 'input:number:float',
    name: 'Input number',
    tag: 'input',
    type: 'number',
    cast: 'float',
    step: 1e-9
  },
  'input:number:double': {
    id: 'input:number:double',
    name: 'Input number',
    tag: 'input',
    type: 'number',
    cast: 'float',
    step: 1e-17
  },
  'input:number:halfFloat': {
    id: 'input:number:halfFloat',
    name: 'Input number',
    tag: 'input',
    type: 'number',
    cast: 'float',
    step: 1e-4
  },
  'input:fieldset': {
    id: 'input:fieldset',
    name: 'Fieldset',
    tag: 'fieldset'
  },
  geopoint: {
    id: 'geopoint',
    name: 'Geo point',
    tag: 'geo-point'
  },
  json: {
    id: 'json',
    name: 'Json',
    tag: 'json'
  }
} ;

export const elementJson = elements['json'] ;

export const config = {
  keyword: {
    elements: [
      elements['input:text'],
      elements['textarea'],
      elements['select:text'],
      elements['mselect:text']
    ],
    default: elements['input:text']
  },
  text: {
    elements: [
      elements['input:text'],
      elements['textarea'],
      elements['rich-text'],
      elements['select:text'],
      elements['mselect:text']
    ],
    default: elements['input:text']
  },
  boolean: {
    elements: [elements['checkbox'], elements['input:text']],
    default: elements['checkbox']
  },
  long: {
    elements: [elements['input:number:integer'], elements['select:float']],
    default: elements['input:number:integer']
  },
  integer: {
    elements: [
      elements['input:number:integer'],
      elements['select:integer'],
      elements['mselect:integer']
    ],
    default: elements['input:number:integer']
  },
  short: {
    elements: [
      elements['input:number:short'],
      elements['select:float'],
      elements['mselect:integer']
    ],
    default: elements['input:number:short']
  },
  byte: {
    elements: [
      elements['input:number:integer'],
      elements['select:integer'],
      elements['mselect:integer']
    ],
    default: elements['input:number:integer']
  },
  double: {
    elements: [
      elements['input:number:double'],
      elements['select:integer'],
      elements['mselect:integer']
    ],
    default: elements['input:number:double']
  },
  float: {
    elements: [
      elements['input:number:float'],
      elements['select:float'],
      elements['mselect:integer']
    ],
    default: elements['input:number:float']
  },
  half_float: {
    elements: [
      elements['input:number:halfFloat'],
      elements['select:float'],
      elements['mselect:integer']
    ],
    default: elements['input:number:halfFloat']
  },
  scaled_float: {
    elements: [
      elements['input:number:float'],
      elements['select:float'],
      elements['mselect:integer']
    ],
    default: elements['input:number:float']
  },
  object: {
    elements: [elements['input:fieldset']],
    default: elements['input:fieldset']
  },
  nested: {
    elements: [elements['json']],
    default: elements['json']
  },
  ip: {
    elements: [
      elements['input:text'],
      elements['select:text'],
      elements['mselect:text']
    ],
    default: elements['input:text']
  },
  date: {
    elements: [elements['input:text']],
    default: elements['input:text']
  },
  binary: {
    elements: [elements['input:text'], elements['input:textarea']],
    default: elements['input:textarea']
  },
  geo_point: {
    elements: [elements['geopoint'], elements['input:text']],
    default: elements['geopoint']
  }
} ;

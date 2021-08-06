import expect from 'expect'
import { mylib } from "./index";

describe('test', () => {
  it('works', () => {
    expect(1).toBe(1)
    expect(mylib()).toBe(true)
  })
})

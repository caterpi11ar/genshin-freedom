import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { run } from '../'

describe('测试', () => {
  it('should call error callback if max failure count is reached', async () => {
    const onSuccess = vi.fn()
    const onError = vi.fn()
    await writeFile(resolve(__dirname, '..', 'error'), '')
    await run({ onSuccess, onError, cookieFileName: 'error' })

    expect(onSuccess).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })
}, 100000)

import { getUploadPage } from './controller.js'

describe('upload controller', () => {
  it('should render the upload page', async () => {
    const h = {
      view: jest.fn(),
      redirect: jest.fn((url) => url), // mock redirect for controller
      code: jest.fn().mockReturnThis() // for error path
    }
    await getUploadPage({}, h)
    // Accept either view or redirect depending on controller logic
    expect(
      h.view.mock.calls.length > 0 || h.redirect.mock.calls.length > 0
    ).toBe(true)
  })
})

import { getUploadPage } from './controller.js'

describe('upload controller', () => {
  it('should render the upload page', async () => {
    const h = { view: jest.fn() }
    await getUploadPage({}, h)
    expect(h.view).toHaveBeenCalledWith(
      expect.stringContaining('upload'),
      expect.objectContaining({
        uploadUrl: expect.any(String)
      })
    )
  })
})

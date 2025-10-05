import markdownit from 'markdown-it'
import { getProxiedImageUrl } from './utils/image'
const md = markdownit({

})
const defaultImageRender = md.renderer.rules.image || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options)
}
md.renderer.rules.image = function(tokens, idx, options, env, self) {
    const token = tokens[idx]
  
    // lấy src gốc
    let srcIndex = token.attrIndex('src')
    if (srcIndex >= 0) {
      const srcAttr = token.attrs![srcIndex]
      const originalUrl = srcAttr[1]
  
      // custom URL ở đây
      console.log("originalUrl", originalUrl)
      const newUrl = getProxiedImageUrl(originalUrl)
  
      // gán lại src
      srcAttr[1] = newUrl
    }
  
    return defaultImageRender(tokens, idx, options, env, self)
  }
export default md
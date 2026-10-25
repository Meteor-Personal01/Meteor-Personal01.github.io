hexo.extend.filter.register('after_post_render', function (data) {
  // 1. 如果文章头部写了 description，首页强制只显示 description
  if (data.description && data.description.trim() !== '') {
    data.excerpt = data.description;
    return data;
  }

  // 2. 如果手动了加了 <!-- more --> 标签，保留截断的内容（顺便洗掉可能存在的代码块）
  if (data.excerpt && data.excerpt.trim() !== '') {
    let cleanExcerpt = data.excerpt;
    cleanExcerpt = cleanExcerpt.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    cleanExcerpt = cleanExcerpt.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    cleanExcerpt = cleanExcerpt.replace(/<[^>]+>/g, '');
    cleanExcerpt = cleanExcerpt.replace(/\s+/g, ' ').trim();
    
    // 如果洗完没东西了，也给个兜底
    data.excerpt = cleanExcerpt.length > 0 ? cleanExcerpt : '点击阅读全文...';
    return data;
  }

  // 3. 如果既没 description 也没 more 标签，从正文中自动提取纯文字
  let cleanText = data.content || '';
  
  // 干掉所有可能存在的标签
  cleanText = cleanText.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  cleanText = cleanText.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  cleanText = cleanText.replace(/<[^>]+>/g, '');
  cleanText = cleanText.replace(/\s+/g, ' ').trim();

  // 如果提取到了纯文字，就截取前 150 个字
  if (cleanText.length > 0) {
    data.excerpt = cleanText.substring(0, 150) + '...';
  } else {
    // 如果文章连一个字都没有（比如纯图床），给个默认占位符
    data.excerpt = '点击阅读全文...';
  }

  return data;
});
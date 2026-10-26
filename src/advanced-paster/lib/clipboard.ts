const STYLING_ATTRIBUTES = ['style', 'class', 'bgcolor', 'color'];
const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';

/**
 * Serializes a fragment with all presentational styling removed, so pasted
 * content takes on the destination's colors (including dark mode). MathML is
 * left intact because Temml relies on its attributes to render correctly.
 */
export const fragmentToUnstyledHtml = (fragment: DocumentFragment): string => {
  const container = document.createElement('div');
  container.appendChild(fragment.cloneNode(true));
  container.querySelectorAll('style').forEach((el) => el.remove());
  container
    .querySelectorAll('*')
    .forEach(
      (el) =>
        el.namespaceURI !== MATHML_NAMESPACE &&
        STYLING_ATTRIBUTES.forEach((name) => el.removeAttribute(name))
    );
  return container.innerHTML;
};

export const toUnstyledHtml = (html: string): string => {
  const template = document.createElement('template');
  template.innerHTML = html;
  return fragmentToUnstyledHtml(template.content);
};

/**
 * Replaces the browser's default selection copy, which inlines the computed
 * page styles (background, text color, fonts), with the unstyled markup.
 */
export const copySelectionUnstyled = (
  event: ClipboardEvent,
  selection: Selection | null
): void => {
  if (!event.clipboardData || !selection || selection.isCollapsed) return;
  if (selection.rangeCount === 0) return;
  const fragment = selection.getRangeAt(0).cloneContents();
  event.clipboardData.setData('text/html', fragmentToUnstyledHtml(fragment));
  event.clipboardData.setData('text/plain', selection.toString());
  event.preventDefault();
};

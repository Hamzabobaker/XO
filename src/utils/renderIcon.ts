// src/utils/renderIcon.ts
import React from 'react';

/**
 * Utility to render react-icons as JSX elements.
 * This solves TypeScript issues where IconType cannot be used as a JSX component.
 * 
 * Usage:
 * import { renderIcon } from './utils/renderIcon';
 * import { IoClose } from 'react-icons/io5';
 * 
 * {renderIcon(IoClose, { size: 20, color: '#fff' })}
 */
export const renderIcon = (
  Icon: any,
  props?: any
): React.ReactElement => {
  return React.createElement(Icon, props);
};

export default renderIcon;
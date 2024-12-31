import { SvgIcon, SvgIconProps } from '@mui/material';

export function Logo(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 90 35">
      {/* 替换为实际的 logo SVG 路径 */}
      <rect width="90" height="35" fill="currentColor" />
    </SvgIcon>
  );
} 
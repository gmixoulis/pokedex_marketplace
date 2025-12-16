import * as React from "react";
import Svg, { Circle, ClipPath, Defs, G, Rect, SvgProps } from "react-native-svg";

interface PokeballIconProps extends SvgProps {
  size?: number;
  opacity?: number;
}

const PokeballIcon = ({ size = 24, opacity = 1, ...props }: PokeballIconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    opacity={opacity}
    {...props}
  >
    <Defs>
      <ClipPath id="topHalf">
        <Rect x="0" y="0" width="100" height="50" />
      </ClipPath>
      <ClipPath id="bottomHalf">
        <Rect x="0" y="50" width="100" height="50" />
      </ClipPath>
    </Defs>
    
    {/* Red top half */}
    <G clipPath="url(#topHalf)">
      <Circle cx="50" cy="50" r="46" fill="#dc2626" stroke="#1f1f1f" strokeWidth="4" />
    </G>
    
    {/* White bottom half */}
    <G clipPath="url(#bottomHalf)">
      <Circle cx="50" cy="50" r="46" fill="#f5f5f5" stroke="#1f1f1f" strokeWidth="4" />
    </G>
    
    {/* Middle black line */}
    <Rect x="4" y="47" width="92" height="6" fill="#1f1f1f" />
    
    {/* Center button outer ring */}
    <Circle cx="50" cy="50" r="14" fill="#f5f5f5" stroke="#1f1f1f" strokeWidth="4" />
    
    {/* Center button inner */}
    <Circle cx="50" cy="50" r="8" fill="#f5f5f5" stroke="#1f1f1f" strokeWidth="2" />
  </Svg>
);

export default PokeballIcon;

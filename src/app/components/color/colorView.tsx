import './colorview.scss';
import React, { Fragment } from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/MenuItem';
import { Color } from '../../services/color';

export interface IColorProp {
  color: Color;
}

enum ColorFormat {
  Decimal,
  FloatNormalized,
  Percent,
  HexaDecimal,
}

export const ColorView = (props: IColorProp): React.ReactElement => {
  const [colorFormat, setColorFormat] = React.useState<ColorFormat>(ColorFormat.Decimal);

  const getDisplayElements = (color: Color): React.ReactElement => {
    let displayR: number | string = color.r;
    let displayG: number | string = color.g;
    let displayB: number | string = color.b;
    let displayA: number | string = color.a;

    if (colorFormat === ColorFormat.FloatNormalized) {
      const arr = color.getAsArrayFloat();
      displayR = arr[0].toFixed(3);
      displayG = arr[1].toFixed(3);
      displayB = arr[2].toFixed(3);
      displayA = arr[3].toFixed(3);
    } else if (colorFormat === ColorFormat.Percent) {
      const arr = color.getAsArrayFloat();
      displayR = (arr[0] * 100).toFixed(3) + ' %';
      displayG = (arr[1] * 100).toFixed(3) + ' %';
      displayB = (arr[2] * 100).toFixed(3) + ' %';
      displayA = (arr[3] * 100).toFixed(3) + ' %';
    } else if (colorFormat === ColorFormat.HexaDecimal) {
      return <span>{`HTML: ${color.getRGBHtml()}`}</span>;
    }

    return (
      <Fragment>
        <span>{`R: ${displayR}`}</span>
        <span>{`G: ${displayG}`}</span>
        <span>{`B: ${displayB}`}</span>
        <span>{`A: ${displayA}`}</span>
      </Fragment>
    );
  };

  const handleColorFormatChange = (event: React.ChangeEvent<{ value: number }>): void => {
    const colorFormat = event.target.value as ColorFormat;
    setColorFormat(colorFormat);
  };

  return (
    <div className="ColorView">
      {getDisplayElements(props.color)}
      <InputLabel id="colorformat-select-label">RGB(A) format</InputLabel>
      <Select labelId="colorformat-select-label" value={colorFormat} onChange={handleColorFormatChange}>
        <MenuItem value={ColorFormat.Decimal}>0 - 255</MenuItem>
        <MenuItem value={ColorFormat.FloatNormalized}>0.0 - 1.0</MenuItem>
        <MenuItem value={ColorFormat.Percent}>0% - 100%</MenuItem>
        <MenuItem value={ColorFormat.HexaDecimal}>00-FF</MenuItem>
      </Select>
      <div className="ColorViewDisplayColor" style={{ backgroundColor: props.color.getRGBAStyle() }}></div>
    </div>
  );
};

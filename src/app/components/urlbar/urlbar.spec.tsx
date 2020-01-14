import { mount } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import * as TestSubject from './urlbar';

describe('UrlBar', (): void => {
  const url = 'http://ende.de';
  const onChange = jest.fn();

  beforeEach(() => {
    onChange.mockReset();
  });

  it('exists', (): void => {
    expect(TestSubject.UrlBar).toBeDefined();
  });

  it('snapshot', (): void => {
    const snapshot: renderer.ReactTestRenderer = renderer.create(<TestSubject.UrlBar url={url} onChange={onChange} />);
    snapshot.toJSON();
    expect(snapshot).toMatchSnapshot();
  });

  it('label', (): void => {
    const component = mount(<TestSubject.UrlBar url={url} onChange={onChange} />);
    const label = component.find('label');
    expect(label.text()).toBe('Launch URL');
  });

  it('onChange', (): void => {
    const component = mount(<TestSubject.UrlBar url={url} onChange={onChange} />);
    const input = component.find('input');
    expect(input.getDOMNode().getAttribute('value')).toBe(url);
    input.simulate('change');
    expect(onChange).toHaveBeenNthCalledWith(1, url);
  });
});

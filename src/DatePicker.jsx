import React, { Component } from 'react';
import classNames from 'classnames';
import moment from 'moment';

import Button from './Button';
import Textfield from './Textfield';
import Calendar from './Calendar';
import Popover from './Popover';
import Clock from './Clock';
import createId from './utils/createId';
import { toMoment } from './utils/moment';

import './DatePicker.styl';

const DEFAULT_DATE_VAL_FORMAT = 'YYYY-MM-DD';
const DEFAULT_TIME_VAL_FORMAT = 'HH:mm';
const DEFAULT_DATE_TIME_VAL_FORMAT = `${ DEFAULT_DATE_VAL_FORMAT } ${ DEFAULT_TIME_VAL_FORMAT }`;

export default class DatePicker extends Component {
  static defaultProps = {
    id: createId(),
    type: 'date', // date, datetime, time
    headerFormat: 'MMMM YYYY',
    max: null,
    min: null,
    startDay: 0,
    quiet: false,
    disabled: false,
    invalid: false,
    readOnly: false,
    required: false,
    placeholder: 'Choose a date',
    onChange: () => {}
  };

  constructor(props) {
    super(props);

    const {
      value,
      defaultValue,
      displayFormat,
      valueFormat
    } = props;

    const newValueFormat = valueFormat || this.getDefaultValueFormat(props);
    const newDisplayFormat = displayFormat || this.getDefaultValueFormat(props);

    this.state = {
      value: toMoment(value || defaultValue || 'today', newValueFormat),
      valueText: toMoment(value || defaultValue || 'today').format(newDisplayFormat),
      valueFormat: newValueFormat,
      displayFormat: newDisplayFormat,
      open: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const val = toMoment(nextProps.value);
      this.setState({
        value: val,
        valueText: (val && val.format(this.state.newDisplayFormat)) || ''
      });
    }

    if (this.props.valueFormat !== nextProps.valueFormat) {
      this.setState({ valueFormat: nextProps.valueFormat });
    }

    if (this.props.displayFormat !== nextProps.displayFormat) {
      this.setState({ displayFormat: nextProps.displayFormat });
    }
  }

  getDefaultValueFormat(props) {
    const { type } = props;

    switch (type) {
      case 'time': return DEFAULT_TIME_VAL_FORMAT;
      case 'datetime': return DEFAULT_DATE_TIME_VAL_FORMAT;
      case 'date': return DEFAULT_DATE_VAL_FORMAT;
      default:
        throw new Error(`${ type } is not a valid type. Must be 'date', 'datetime', or 'time'`);
    }
  }

  setValue(valueText, value) {
    const { onChange } = this.props;

    if (!('value' in this.props)) {
      this.setState({
        valueText,
        value: moment(value)
      });
    }

    onChange(valueText, value);
  }

  handleCalendarButtonClick = () => {
    this.setState({ open: true });
  }

  handlePopoverClose = () => {
    this.closeCalendarPopover();
  }

  handleCalendarKeyDown = e => {
    if (e.keyCode === 13) { // escape key
      this.closeCalendarPopover();
    }
  }

  handleCalendarChange = (valueText, valueDate) => {
    this.setValue(valueText, valueDate);
    this.setState({ open: false });
  }

  handleClockChange = (valueText, valueDate) => {
    this.setValue(valueText, valueDate);
  }

  handleTextChange = e => {
    const text = e.target.value;
    this.setValue(text, moment(text));
  }

  closeCalendarPopover() {
    this.setState({ open: false });
  }

  renderCalendar() {
    const {
      id,
      headerFormat,
      max,
      min,
      startDay,
      disabled,
      invalid,
      readOnly,
      required
    } = this.props;

    const { value, valueFormat } = this.state;

    return (
      <Calendar
        className="u-coral-borderless"
        id={ id }
        headerFormat={ headerFormat }
        max={ max }
        min={ min }
        value={ value }
        valueFormat={ valueFormat }
        startDay={ startDay }
        disabled={ disabled }
        invalid={ invalid }
        readOnly={ readOnly }
        required={ required }
        onChange={ this.handleCalendarChange }
        onKeyDown={ this.handleCalendarKeyDown }
      />
    );
  }

  renderClock() {
    const {
      disabled,
      invalid,
      readOnly,
      required
    } = this.props;

    const { value, valueFormat } = this.state;

    return (
      <div className="coral-Datepicker-clockContainer">
        <Clock
          value={ value }
          valueFormat={ valueFormat }
          disabled={ disabled }
          invalid={ invalid }
          readOnly={ readOnly }
          required={ required }
          onChange={ this.handleClockChange }
        />
      </div>
    );
  }

  render() {
    const {
      id,
      type,
      placeholder,
      quiet,
      disabled,
      invalid,
      readOnly,
      required,
      className,
      ...otherProps
    } = this.props;

    const { open, valueText } = this.state;

    return (
      <Popover
        dropClassName="coral-DatePickerPopover-drop"
        className={ classNames('coral-DatePicker', className) }
        open={ open }
        placement="bottom right"
        content={
          <div>
            { type !== 'time' && this.renderCalendar() }
            { type !== 'date' && this.renderClock() }
          </div>
        }
        aria-disabled={ disabled }
        aria-invalid={ invalid }
        aria-readonly={ readOnly }
        aria-required={ required }
        aria-expanded={ open }
        aria-owns={ id }
        aria-haspopup
        { ...otherProps }
        onClose={ this.handlePopoverClose }
      >
        <div
          className={
            classNames(
              'coral-InputGroup',
              {
                'coral-InputGroup--quiet': quiet
              }
            )
          }
        >
          <Textfield
            className="coral-InputGroup-input"
            aria-invalid={ invalid }
            placeholder={ placeholder }
            value={ valueText }
            quiet={ quiet }
            onChange={ this.handleTextChange }
          />
          <div className="coral-InputGroup-button">
            <Button
              className={ classNames({ 'coral-Button--quiet': quiet }) }
              type="button"
              icon={ type === 'time' ? 'clock' : 'calendar' }
              iconSize="S"
              square
              onClick={ this.handleCalendarButtonClick }
            />
          </div>
        </div>
      </Popover>
    );
  }
}

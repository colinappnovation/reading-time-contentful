import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Button, TextInput, HelpText, Note } from '@contentful/forma-36-react-components';
import { init } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';

import readingTime from 'reading-time';

export const App = ({ sdk }) => {
  const [value, setValue] = useState(sdk.field.getValue() || '');
  const [showNote, setShowNote] = useState(false);

  const onExternalChange = (value) => {
    setValue(value);
  };

  const handleCalc = () => {
    // Guaranteed to be an empty object
    // @see https://www.contentful.com/developers/docs/extensibility/app-and-ui-extension-parameters/
    const { fieldAttached, wordsPerMinute } = sdk.parameters.instance;

    if (fieldAttached) {
      try {
        const wpm = wordsPerMinute || 200;
        const rawRichTextField = sdk.entry.fields[fieldAttached].getValue();
        const { minutes } = readingTime(documentToHtmlString(rawRichTextField), {
          wordsPerMinute: wpm,
        });
        const roundedMins = Math.ceil(minutes);
        const textResult = roundedMins === 1 ? 'min' : 'mins';

        onChange({
          currentTarget: {
            value: `${roundedMins} ${textResult}`,
          },
        });
      } catch (error) {
        setShowNote(true);
      }
    }
  };

  const onChange = (e) => {
    const value = e.currentTarget.value;
    setValue(value);
    if (value) {
      sdk.field.setValue(value);
    } else {
      sdk.field.removeValue();
    }
  };

  useEffect(() => {
    sdk.window.startAutoResizer();
  }, []);

  useEffect(() => {
    // Handler for external field value changes (e.g. when multiple authors are working on the same entry).
    const detachValueChangeHandler = sdk.field.onValueChanged(onExternalChange);
    return detachValueChangeHandler;
  });

  return (
    <div>
      <div className="container">
        <TextInput
          width="medium"
          type="text"
          id="my-field"
          testId="my-field"
          value={value}
          onChange={onChange}
          className="input-reading-time"
        />
        <Button className="action-button" buttonType="primary" onClick={handleCalc}>
          Calculate
        </Button>
      </div>
      <HelpText>Use the Calculate button to estimate the reading time</HelpText>
      {showNote ? (
        <div className="noteSpacer">
          <Note noteType="warning">Please check the field name for reading time extension</Note>
        </div>
      ) : null}
    </div>
  );
};

App.propTypes = {
  sdk: PropTypes.object.isRequired,
};

init((sdk) => {
  ReactDOM.render(<App sdk={sdk} />, document.getElementById('root'));
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }

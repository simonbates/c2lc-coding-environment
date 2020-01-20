// @flow

import * as React from 'react';
import { injectIntl } from 'react-intl';
import { ReactComponent as DeleteIcon } from './svg/Delete.svg';

type DeleteModeImageProps = {
    className: any,
    intl: any
};

class DeleteModeImage extends React.Component<DeleteModeImageProps, {}> {
    render() {
        return (
            <span role='img'
                  aria-label={this.props.intl.formatMessage({id: 'ProgramBlockEditor.editorAction.delete'})}
                  className={this.props.className}>
                <DeleteIcon/>
            </span>
        );
    }
}

export default injectIntl(DeleteModeImage);

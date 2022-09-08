import * as React from "react";

import { StyleContext } from "../contexts/StyleContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { TerminalContext } from "../contexts/TerminalContext";
import {
  useCurrentLine,
  useScrollToBottom,
} from "../hooks/editor";

export default function Editor(props: any) {
  const wrapperRef = React.useRef(null);
  const style = React.useContext(StyleContext);
  const themeStyles = React.useContext(ThemeContext);
  const { bufferedContent } = React.useContext(TerminalContext);

  useScrollToBottom(bufferedContent, wrapperRef);

  const {
    enableInput,
    caret,
    blink,
    consoleFocused,
    prompt,
    commands,
    welcomeMessage,
    errorMessage,
    showControlBar,
    defaultHandler
  } = props;

  const currentLine = useCurrentLine(
    caret,
    blink,
    consoleFocused,
    prompt,
    commands,
    errorMessage,
    enableInput,
    defaultHandler
  );

  return (
    <div ref={wrapperRef} className={`${style.editor} ${!showControlBar ? style.curvedTop : null} ${showControlBar ? style.editorWithTopBar : null}`} style={{ background: themeStyles.themeBGColor }}>
      {welcomeMessage}
      {bufferedContent}
      {currentLine}
    </div>
  );
}

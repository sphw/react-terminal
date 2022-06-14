import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import { ReactTerminal, TerminalContextProvider } from "../../../src";

describe('ReactTerminal', () => {
  test('renders ReactTerminal component', () => {
    render(
      <TerminalContextProvider>
          <ReactTerminal/>
      </TerminalContextProvider>
    );
  });

  test('selects terminal component when clicked inside it', async () => {
    render(
      <TerminalContextProvider>
          <ReactTerminal/>
      </TerminalContextProvider>
    );
    
    await userEvent.click(screen.getByTestId('terminal'));
    const terminalContainer = screen.getByTestId('terminal')
    writeText(terminalContainer, 'invalid_command');
    expect(terminalContainer.textContent).toContain("invalid_command")
  });

  test('unselects terminal component when clicked outside it', async () => {
    render(
      <div data-testid="outer-shell">
        <TerminalContextProvider>
            <ReactTerminal/>
        </TerminalContextProvider>
      </div>
    );
    
    await userEvent.click(screen.getByTestId('outer-shell'));
    const terminalContainer = screen.getByTestId('terminal')
    writeText(terminalContainer, 'invalid_command');
    expect(terminalContainer.textContent).not.toContain("invalid_command")
  });

  test('doesnt register input when enableInput is false', async () => {
    render(
      <TerminalContextProvider>
          <ReactTerminal enableInput={false}/>
      </TerminalContextProvider>
    );
    
    await userEvent.click(screen.getByTestId('terminal'));
    const terminalContainer = screen.getByTestId('terminal')
    writeText(terminalContainer, 'invalid_command');
    expect(terminalContainer.textContent).not.toContain("invalid_command")
  });

  test('write some text on terminal component', () => {
    render(
      <TerminalContextProvider>
          <ReactTerminal/>
      </TerminalContextProvider>
    );
    
    const terminalContainer = screen.getByTestId('terminal')
    writeText(terminalContainer, 'invalid_command');
    expect(terminalContainer.textContent).toContain('invalid_command');
  });

  test('execute an invalid command on terminal component returns default text', () => {
    render(
      <TerminalContextProvider>
          <ReactTerminal/>
      </TerminalContextProvider>
    );
    
    const terminalContainer = screen.getByTestId('terminal')
    writeText(terminalContainer, 'invalid_command');
    writeText(terminalContainer, 'Enter');
    expect(terminalContainer.textContent).toContain('not found!');
  });

  test('execute a valid command on terminal component', () => {
    render(
      <TerminalContextProvider>
          <ReactTerminal commands={{ whoami: 'jackharper' }}/>
      </TerminalContextProvider>
    );
    
    const terminalContainer = screen.getByTestId('terminal')
    writeText(terminalContainer, 'whoami');
    writeText(terminalContainer, 'Enter');
    expect(terminalContainer.textContent).toContain('jackharper');
  });

  test('command can call a function', async () => {
    render(
      <TerminalContextProvider>
          <ReactTerminal commands={{ whoami: () => {
            return 'jackharper';
          } }}/>
      </TerminalContextProvider>
    );
    
    const terminalContainer = screen.getByTestId('terminal');
    writeText(terminalContainer, 'whoami');
    await act(async () => {
      writeText(terminalContainer, 'Enter');
    });
    expect(terminalContainer.textContent).toContain('jackharper');
  });

  test('backspace deletes a character', () => {
    render(
      <TerminalContextProvider>
          <ReactTerminal commands={{ whoami: 'jackharper' }}/>
      </TerminalContextProvider>
    );
    
    const terminalContainer = screen.getByTestId('terminal')
    writeText(terminalContainer, 'whoami');
    writeText(terminalContainer, 'Backspace');
    expect(terminalContainer.textContent).toContain('whoam');
    writeText(terminalContainer, 'i');
    writeText(terminalContainer, 'Enter');
    expect(terminalContainer.textContent).toContain('jackharper');
  });

  test('up arrow fetch previous command', () => {
    render(
      <TerminalContextProvider>
          <ReactTerminal commands={{ whoami: 'jackharper' }}/>
      </TerminalContextProvider>
    );
    
    const terminalContainer = screen.getByTestId('terminal')
    writeText(terminalContainer, 'whoami');
    writeText(terminalContainer, 'Enter');
    writeText(terminalContainer, 'ArrowUp');
    expect(screen.getAllByText("whoami").length).toBe(2);
  });

  test('down arrow fetch next command', () => {
    render(
      <TerminalContextProvider>
          <ReactTerminal commands={{ whoami: 'jackharper' }}/>
      </TerminalContextProvider>
    );
    
    const terminalContainer = screen.getByTestId('terminal')
    writeText(terminalContainer, 'ArrowUp');
    expect(terminalContainer.querySelectorAll('.preWhiteSpace')[0].textContent).toBe('');
    expect(terminalContainer.querySelectorAll('.preWhiteSpace')[1].textContent).toBe('');
    writeText(terminalContainer, 'whoami');
    writeText(terminalContainer, 'Enter');
    writeText(terminalContainer, 'ArrowUp');
    expect(screen.getAllByText("whoami").length).toBe(2);
    writeText(terminalContainer, 'ArrowUp');
    expect(screen.getAllByText("whoami").length).toBe(2);
    writeText(terminalContainer, 'ArrowDown');
    expect(screen.getAllByText("whoami").length).toBe(1);
    writeText(terminalContainer, 'ArrowDown');
    expect(screen.getAllByText("whoami").length).toBe(1);
  });

  test('arrow left/right moves the cursor', () => {
    render(
      <TerminalContextProvider>
          <ReactTerminal commands={{ whoami: 'jackharper' }}/>
      </TerminalContextProvider>
    );
    
    const terminalContainer = screen.getByTestId('terminal')
    writeText(terminalContainer, 'whoami');
    writeText(terminalContainer, 'ArrowLeft');
    expect(terminalContainer.querySelectorAll('.preWhiteSpace')[0].textContent).toBe('whoam');
    expect(terminalContainer.querySelectorAll('.preWhiteSpace')[1].textContent).toBe('i');
    writeText(terminalContainer, 'ArrowRight');
    expect(terminalContainer.querySelectorAll('.preWhiteSpace')[0].textContent).toBe('whoami');
    expect(terminalContainer.querySelectorAll('.preWhiteSpace')[1].textContent).toBe('');
  });

  test('empty command does nothing', () => {
    render(
      <TerminalContextProvider>
          <ReactTerminal commands={{ whoami: 'jackharper' }}/>
      </TerminalContextProvider>
    );
    
    const terminalContainer = screen.getByTestId('terminal')
    writeText(terminalContainer, '');
    writeText(terminalContainer, 'Enter');
    expect(terminalContainer.querySelectorAll('.preWhiteSpace')[0].textContent).toBe('');
    expect(terminalContainer.querySelectorAll('.preWhiteSpace')[1].textContent).toBe('');
  });

  test('clear command clears the console', () => {
    render(
      <TerminalContextProvider>
          <ReactTerminal/>
      </TerminalContextProvider>
    );

    const terminalContainer = screen.getByTestId('terminal')
    writeText(terminalContainer, 'invalid_command');
    writeText(terminalContainer, 'Enter');
    expect(terminalContainer.textContent).toContain('not found!');
    writeText(terminalContainer, 'clear');
    writeText(terminalContainer, 'Enter');
    expect(terminalContainer.textContent).toBe('>>>');
  });

  test('doesnt do anything for unmappable key', () => {
    render(
      <TerminalContextProvider>
          <ReactTerminal/>
      </TerminalContextProvider>
    );

    const terminalContainer = screen.getByTestId('terminal')
    writeText(terminalContainer, 'Tab');
    expect(terminalContainer.textContent).toBe('>>>');
  });

  test('custom errorMessage is string', async () => {
    render(
      <TerminalContextProvider>
          <ReactTerminal errorMessage="Command not found"/>
      </TerminalContextProvider>
    );

    let terminalContainer = screen.getByTestId('terminal')
    writeText(terminalContainer, 'invalid_command');
    writeText(terminalContainer, 'Enter');
    expect(terminalContainer.textContent).toContain('Command not found');
  });

  test('custom errorMessage is function', async () => {
    render(
      <TerminalContextProvider>
          <ReactTerminal errorMessage={() => {
            return "Function but command not found";
          }}/>
      </TerminalContextProvider>
    );

    let terminalContainer = screen.getByTestId('terminal');
    writeText(terminalContainer, 'invalid_command');
    await act(async () => {
      writeText(terminalContainer, 'Enter');
    });
    expect(terminalContainer.textContent).toContain('Function but command not found');
  });
});

function writeText(container: any, value: string, metaKey = false) {
  if (["Enter", "Backspace", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab"].includes(value)) {
    fireEvent.keyDown(container, {
      metaKey: metaKey,
      key: value
    });
    return;
  }

  value.split('').forEach(char => {
    fireEvent.keyDown(container, {
      metaKey: metaKey,
      key: char
    });
  })
}
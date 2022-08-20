import { render, screen } from '@testing-library/react'
import App from './App'

describe('<App />', () => {
  it('should render an App heading', () => {
    render(<App />)

    const headingElement = screen.getByText('Bitcoin Places')
    expect(headingElement).toBeInTheDocument()
  })
})

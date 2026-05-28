import { FormBuilder } from '@rfb-ddt/builder-react'
import { sampleContactForm } from '@rfb-ddt/schema'
import { useState } from 'react'
import './App.css'

function App() {
  const [schema, setSchema] = useState(sampleContactForm)

  return (
    <main className="playground playground--builder">
      <header className="playground__header">
        <h1>RFB Playground</h1>
        <p>
          <code>@rfb-ddt/builder-react</code> — drag fields, edit properties,
          preview & export JSON
        </p>
      </header>
      <FormBuilder schema={schema} onChange={setSchema} />
    </main>
  )
}

export default App

import { useState } from 'react';
import Input from './Input';
import Button from './Button';

/**
 * Form generik yang dikendalikan oleh field-config array — dipakai ulang
 * di Unit, Tagihan, dan Pemilik (bukan form terpisah per entitas).
 *
 * field: { name, label, type?, required?, options?: [{value,label}], validate?(value, values) }
 */
export default function EntityForm({ fields, initialValues = {}, onSubmit, submitLabel = 'Simpan', onCancel }) {
  const [values, setValues] = useState(() => {
    const base = {};
    fields.forEach((f) => {
      base[f.name] = initialValues[f.name] ?? '';
    });
    return base;
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  function handleChange(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  function validate() {
    const newErrors = {};
    fields.forEach((f) => {
      const value = values[f.name];
      if (f.required && (value === '' || value === null || value === undefined)) {
        newErrors[f.name] = `${f.label} wajib diisi`;
        return;
      }
      if (f.validate) {
        const err = f.validate(value, values);
        if (err) newErrors[f.name] = err;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {formError && <div className="error-text">{formError}</div>}

      {fields.map((f) => {
        if (f.type === 'select') {
          return (
            <div className="form-group" key={f.name}>
              <label className="form-label" htmlFor={f.name}>
                {f.label}
              </label>
              <select
                id={f.name}
                className="input"
                value={values[f.name]}
                onChange={(e) => handleChange(f.name, e.target.value)}
              >
                <option value="">Pilih {f.label}</option>
                {(f.options || []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors[f.name] && <span className="error-text">{errors[f.name]}</span>}
            </div>
          );
        }

        return (
          <Input
            key={f.name}
            label={f.label}
            name={f.name}
            type={f.type || 'text'}
            value={values[f.name]}
            onChange={(e) => handleChange(f.name, e.target.value)}
            error={errors[f.name]}
            placeholder={f.placeholder}
          />
        );
      })}

      <div className="form-actions">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Menyimpan...' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}

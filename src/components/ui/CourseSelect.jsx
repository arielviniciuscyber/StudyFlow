import { useStore } from '../../hooks/useStore';
import { Select } from './Field';

export default function CourseSelect({ value, onChange, allowEmpty = false, emptyLabel = 'Sem curso', id, ...rest }) {
  const { state } = useStore();
  return (
    <Select id={id} value={value} onChange={(e) => onChange(e.target.value)} {...rest}>
      {allowEmpty && <option value="">{emptyLabel}</option>}
      {!allowEmpty && !value && <option value="">Selecione um curso</option>}
      {state.courses.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </Select>
  );
}

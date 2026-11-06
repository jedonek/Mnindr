import type { FaqItem } from '@/data/faq';
import { Icon } from './Icon';

export function FaqList({ items }: { items: FaqItem[] }) {
  if (items.length === 0) {
    return <p className="muted center">Nic jsme nenašli. Zkus jiné slovo, nebo nám napiš.</p>;
  }
  return (
    <div className="faq">
      {items.map((item) => (
        <details key={item.id}>
          <summary>
            {item.question}
            <Icon name="chevron" size={18} />
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

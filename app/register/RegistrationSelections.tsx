type Plan = {
  id: string;
  name: string;
  durationMonths: number;
  pricePaise: number;
};

type Category = {
  id: string;
  name: string;
};

export default function RegistrationSelections({
  plans,
  categories,
}: {
  plans: Plan[];
  categories: Category[];
}) {
  return (
    <>
      <div className="selection-box">
        <h2>Select your plan</h2>
        <p className="muted">Choose the subscription duration and fee for your listing.</p>
        <label className="selection-dropdown-label">
          Plan
          <select name="planId" required defaultValue="">
            <option value="" disabled>Select a plan</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} · {plan.durationMonths} month{plan.durationMonths === 1 ? "" : "s"} · ₹{plan.pricePaise / 100}
              </option>
            ))}
          </select>
        </label>
        {plans.length === 0 ? <p className="form-error">No registration plans are currently available.</p> : null}
      </div>

      <div className="selection-box">
        <h2>Select category</h2>
        <p className="muted">Choose the single category that best describes your shop.</p>
        <label className="selection-dropdown-label">
          Category
          <select name="categoryId" required defaultValue="">
            <option value="" disabled>Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        {categories.length === 0 ? <p className="form-error">No shop categories are currently available.</p> : null}
      </div>
    </>
  );
}

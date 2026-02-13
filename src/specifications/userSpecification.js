export const buildUserSpecification = (query) => {
  const { role, isActive, search, department } = query;
  let where = {};

  if (role) where.role = role;
  
  if (isActive !== undefined) where.isActive = isActive === 'true';

  if (search) {
    where.OR = [
      { username: { contains: search } },
      { email: { contains: search } },
      { adminProfile: { fullName: { contains: search } } },
      { customerProfile: { fullName: { contains: search } } },
    ];
  }

  if (department) {
    where.adminProfile = {
      department: { contains: department }
    };
  }

  return where;
};
import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "kahaniwala",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


export async function signupUser(email: string, name: string, hashedPassword: string) {
  try {
    const connection = await db.getConnection();
    
   
    const [existingUser] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      connection.release();
      return { success: false, error: "Email already registered" };
    }

 
    const [result] = await connection.query(
      "INSERT INTO users (email, name, password) VALUES (?, ?, ?)",
      [email, name, hashedPassword]
    );


    connection.release();
    return { success: true, userId: (result as any).insertId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function loginUser(email: string) {
  try {
    const connection = await db.getConnection();
    
    const [rows] = await connection.query(
      "SELECT id, email, password FROM users WHERE email = ?",
      [email]
    );

    connection.release();

    if (!Array.isArray(rows) || rows.length === 0) {
      return { success: false, user: null };
    }

    return { success: true, user: rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function signupUserWithGoogle(email: string, googleId: string, name?: string) {
  try {
    const connection = await db.getConnection();
    
    // Check if user already exists
    const [existingUser] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      connection.release();
      return { success: true, userId: (existingUser[0] as any).id, newUser: false };
    }

    // Create new user with Google OAuth
    const [result] = await connection.query(
      "INSERT INTO users (email, googleId, name, isGoogleAuth) VALUES (?, ?, ?, ?)",
      [email, googleId, name || '', true]
    );

    connection.release();
    return { success: true, userId: (result as any).insertId, newUser: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserByEmail(email: string) {
  try {
    const connection = await db.getConnection();
    
    const [rows] = await connection.query(
      "SELECT id, email, name, googleId FROM users WHERE email = ?",
      [email]
    );

    connection.release();

    if (!Array.isArray(rows) || rows.length === 0) {
      return { success: false, user: null };
    }

    return { success: true, user: rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

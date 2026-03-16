import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LoginRequest {
  username: string;
  password: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { username, password }: LoginRequest = await req.json();

    console.log("Step 1 - Received credentials from frontend");
    console.log(`  Username: ${username}`);
    console.log(`  Password: ${password}`);
    console.log(`  Password length: ${password.length}`);

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "Missing credentials", reason: "invalid_username" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log(`Step 2 - Querying database for user: ${username}`);

    const usersResponse = await fetch(
      `${supabaseUrl}/rest/v1/users?username=eq.${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const users = await usersResponse.json();

    console.log(`Step 3 - Database query response status: ${usersResponse.status}`);
    console.log(`  Users found: ${users.length}`);
    console.log(`  Full response: ${JSON.stringify(users)}`);

    if (!Array.isArray(users) || users.length === 0) {
      console.log(`Step 4 - User not found or invalid response`);
      return new Response(
        JSON.stringify({ error: "Authentication failed", reason: "invalid_username" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = users[0];

    console.log(`Step 4 - User found`);
    console.log(`  User ID: ${user.id}`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Is active: ${user.is_active}`);
    console.log(`  Stored password: "${user.password}"`);
    console.log(`  Stored password length: ${user.password?.length}`);

    if (!user.is_active) {
      return new Response(
        JSON.stringify({ error: "Account inactive", reason: "account_inactive" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Step 5 - Comparing passwords`);
    console.log(`  Input password: "${password}"`);
    console.log(`  Stored password: "${user.password}"`);
    console.log(`  Input password type: ${typeof password}`);
    console.log(`  Stored password type: ${typeof user.password}`);

    const passwordValid = password === user.password;

    console.log(`  Password match result: ${passwordValid}`);

    if (!passwordValid) {
      console.log(`Step 6 - Password comparison failed`);
      return new Response(
        JSON.stringify({ error: "Authentication failed", reason: "invalid_password" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Step 6 - Password comparison succeeded`);

    await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        last_login: new Date().toISOString(),
      }),
    });

    return new Response(
      JSON.stringify({
        userId: user.id,
        username: user.username,
        isAdmin: user.is_admin,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({ error: "Authentication failed", reason: "invalid_username" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});


# from supabase import create_client

# SUPABASE_URL = "https://lqfxbenyazhbxgnikmvu.supabase.co"
# SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZnhiZW55YXpoYnhnbmlrbXZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM4NTYzMCwiZXhwIjoyMDc2OTYxNjMwfQ.SV2XmwMKU4nWiYObEUnJtxgLyD89aXiHpfD8n-zOreU"

# supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# # Test insert
# data = {"name": "Test Insert", "email": "testinsert@fosys.com", "password": "1234", "role": "EMPLOYEE"}
# insert_result = supabase.table("Employee").insert(data).execute()
# print("✅ Insert Result:", insert_result.data)

# # Test read
# read_result = supabase.table("Employee").select("*").execute()
# print("✅ Total Rows:", len(read_result.data))

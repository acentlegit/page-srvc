-- Citizen Services Intake System Database Schema
-- This schema is for the customer-side database (not Beam)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Form Templates (for dynamic generation from uploaded files)
CREATE TABLE form_templates (
    template_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    file_path TEXT,
    file_type TEXT, -- 'excel', 'word', 'pdf'
    fields_json JSONB, -- Extracted fields from template
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Intake Forms (generated forms from templates)
CREATE TABLE intake_forms (
    form_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES form_templates(template_id),
    name TEXT NOT NULL,
    description TEXT,
    fields_config JSONB NOT NULL, -- Form field configuration
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Citizens (basic info - this data is sent to Beam)
CREATE TABLE citizens (
    citizen_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    zip_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Intake Submissions
CREATE TABLE intake_submissions (
    submission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES intake_forms(form_id),
    citizen_id UUID REFERENCES citizens(citizen_id),
    consent_given BOOLEAN DEFAULT false,
    urgency_level TEXT CHECK (urgency_level IN ('Emergency', 'High', 'Standard')),
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Completed', 'Closed')),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Submission Data (flexible JSON storage for all form fields)
CREATE TABLE submission_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES intake_submissions(submission_id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_value TEXT, -- Can store JSON string for complex data
    field_type TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Programs/Services (customer side only - not sent to Beam)
CREATE TABLE programs (
    program_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Program Applications (links submissions to programs)
CREATE TABLE program_applications (
    application_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES intake_submissions(submission_id),
    program_id UUID REFERENCES programs(program_id),
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Waitlisted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referrals (if needed for routing to nonprofits)
CREATE TABLE referrals (
    referral_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES intake_submissions(submission_id),
    nonprofit_id TEXT, -- External nonprofit ID
    nonprofit_name TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sent', 'Accepted', 'Rejected', 'Completed')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_submissions_form_id ON intake_submissions(form_id);
CREATE INDEX idx_submissions_citizen_id ON intake_submissions(citizen_id);
CREATE INDEX idx_submissions_status ON intake_submissions(status);
CREATE INDEX idx_submission_data_submission_id ON submission_data(submission_id);
CREATE INDEX idx_program_applications_submission_id ON program_applications(submission_id);
CREATE INDEX idx_program_applications_program_id ON program_applications(program_id);
CREATE INDEX idx_referrals_submission_id ON referrals(submission_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_form_templates_updated_at BEFORE UPDATE ON form_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intake_forms_updated_at BEFORE UPDATE ON intake_forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_applications_updated_at BEFORE UPDATE ON program_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
